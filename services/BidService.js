const Auction = require("../models/Auction");
const BidItem = require("../models/BidItem");
const BidTimeline = require("../models/BidTimeline");
const FarmerProduce = require("../models/FarmerProduce");
const moment = require("moment-timezone");
const BidService = {
  /**
   * Initiate an auction.
   *
   * @param data
   * @returns false / Auction Object.
   */
  async initiateAuction(data) {
    try {
      const auction = await Auction.create(data);
      if (!auction) {
        return false;
      }
      return auction;
    } catch (error) {
      throw new Error(`Failed to initiate the auction process: ${error}`);
    }
  },

  /**
   * Open or close an auction
   *
   * @param bid
   * @param action open / close; defaults to close
   * @returns bool
   */
  async openOrCloseAuction(bid, action = "close") {
    try {
      let auctionStatus = "closed";
      const auction = await Auction.findOne({ _id: bid.auctionId });

      if (action === "open") {
        auctionStatus = "open";
        await FarmerProduce.findOneAndUpdate(
          {
            farmerId: auction.farmer,
            itemname: auction.itemname,
          },
          {
            itemstatus: "Available",
            itemquantity: bid.itemquantity,
          }
        );
      } else {
        await FarmerProduce.findOneAndUpdate(
          {
            farmerId: auction.farmer,
            itemname: auction.itemname,
          },
          {
            itemstatus: "Sold",
          }
        );
      }

      await Auction.findOneAndUpdate(
        {
          _id: bid.auctionId,
        },
        { auctionStatus }
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to close/open auction: ${error}`);
    }
  },

  /**
   * Bid on an auction
   *
   * @param data Bid data
   * @returns boolean | Bid
   */
  async bidOnAnAuction(bid) {
    try {
      const { buyerId, itemname, farmerId } = bid;

      // check if a bid exists.
      const bidItem = await BidItem.exists({
        buyerId,
        itemname,
        farmerId,
      });

      // get auction id
      let auction = await Auction.findOne({ itemname, farmer: farmerId })
        .sort({ createdAt: -1 })
        .exec();

      if (!auction) {
        auction = await this.initiateAuction({ farmer: farmerId, itemname });
      }

      if (auction.auctionStatus === "closed") {
        return 0;
      }

      bid.auctionId = auction._id;

      if (bidItem) {
        // if a buyer has already bid on an auction, update the bid.
        return await this.updateBidItem(bidItem._id, bid);
      }

      // create a new bid.
      return await BidItem.create(bid);
    } catch (error) {
      throw new Error(`Failed to bid on an auction!`);
    }
  },

  /**
   * Accept  bid
   *
   * @param bid_id the bid to accept
   * @returns bool
   */
  async acceptBid(bid_id) {
    try {
      const bid = await BidItem.findOne({ _id: bid_id });

      const auction = await Auction.exists({
        _id: bid.auctionId,
        auctionStatus: "closed",
      });

      if (auction) {
        return 0;
      }

      bid.accepteddate = moment().format();
      bid.acceptedtime = moment().format("h:mm:ss");
      bid.save();

      // Update farmer produce to take away the bid items(quantity)
      const farmerProduce = await FarmerProduce.findOne({
        itemname: bid.itemname,
        farmerId: bid.farmerId,
      });

      if (farmerProduce) {
        farmerProduce.itemquantity -= bid.quantitybuyerneeds;
        farmerProduce.save();
      }

      await this.openOrCloseAuction(bid, "close");
      return true;
    } catch (error) {
      throw new Error(`Failed to accept bid. Please try again later`);
    }
  },

  /**
   * Get the auctions and their bids for a product
   *
   * @param query
   * @returns Auction
   */
  async getAuctions(query) {
    try {
      if (!query) {
        query = {};
      }
      return await Auction.find(query)
        .populate([
          {
            path: "bidItems",
            populate: [{ path: "buyer" }],
          },
        ])
        .populate("farmer")
        .exec();
    } catch (error) {
      throw new Error(`Failed to get product auctions!`);
    }
  },

  /**
   * Get bidson
   *
   * @param query filter by aution id.
   * @returns Auction
   */
  async getBidItems(filter, query_params) {
    try {
      let filter_query = {};
      switch (filter) {
        case "farmer":
          filter_query = {
            farmerId: query_params.farmerId,
          };
          if (query_params.itemname) {
            filter_query = { ...filter_query, itemname: query_params.itemname };
          }
          break;
        case "accepted":
          filter_query = {
            accepteddate: { $exists: true, $ne: null },
            acceptedtime: { $exists: true, $ne: null },
          };
          // fetch accepted ones for a given farmer
          if (query_params.farmerId) {
            filter_query = { ...filter_query, farmerId: query_params.farmerId };
          }

          // fetch accepted ones for a given buyer
          if (query_params.buyerId) {
            filter_query = { ...filter_query, buyerId: query_params.buyerId };
          }
          break;
        case "buyer":
          filter_query = {
            buyerId: query_params.buyerId,
          };

          if (query_params.itemname) {
            filter_query = { ...filter_query, itemname: query_params.itemname };
          }
          break;

        case "declined":
          filter_query = {
            accepteddate: { $exists: false },
            acceptedtime: { $exists: false },
          };
          // fetch accepted ones for a given farmer
          if (query_params.farmerId) {
            filter_query = { ...filter_query, farmerId: query_params.farmerId };
          }

          // fetch accepted ones for a given buyer
          if (query_params.buyerId) {
            filter_query = { ...filter_query, buyerId: query_params.buyerId };
          }
          break;
        default:
          break;
      }
      return await BidItem.find(filter_query)
        .populate("buyer")
        .populate("farmer")
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to get product auctions!`);
    }
  },

  async createBidTimeline(
    bid,
    acceptedPurchase = false,
    purchasedDetails = false
  ) {
    try {
      let bidTimeline = BidTimeline.findOne({
        bidId: bid._id,
        auctionId: bid.auctionId,
      });

      if (!bidTimeline) {
        bidTimeline = new BidTimeline({
          bidId: bid._id,
          auctionId: bid.auctionId,
        });
      }

      bidTimeline.acceptedPurchase = acceptedPurchase;
      bidTimeline.purchasedDetails = purchasedDetails;

      if (acceptedPurchase) {
        bidTimeline.acceptedPurchaseAt = moment().format();
      }

      if (purchasedDetails) {
        bidTimeline.purchasedDetailsAt = moment().format();
      }

      return await bidTimeline.save();
    } catch (error) {
      throw new Error(`Failed to create bid timeline: ${error}`);
    }
  },

  fetchBidItems(start, end, interval) {
    return new Promise((resolve, reject) => {
      BidItem.aggregate(
        [
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                $toDate: { 
                  $subtract: [
                    { $toLong: "$createdAt" },
                    { $mod: [{ $toLong: "$createdAt" }, interval] },
                  ],
                },
              },
              price: { $avg: "$buyerprice" },
            },
          },
          {
            $project: {
              _id: 0,
              x: { $dateToString: { format: "%H:%M", date: "$_id" } },
              y: { $round: ["$price", 0] },
            },
          },
        ],
        function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  },

  async updateBidItem(bid_id, data) {
    try {
      return await BidItem.findOneAndUpdate(
        { _id: bid_id },
        {
          $set: data,
        },
        { new: true }
      );
    } catch (error) {
      console.log(err);
      throw new Error(error);
    }
  },
};

module.exports = BidService;