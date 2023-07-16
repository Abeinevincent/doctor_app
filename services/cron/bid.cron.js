const moment = require("moment/moment");
const AuctionSetting = require("../../models/AuctionSetting");
const BidTimeline = require("../../models/BidTimeline");
const BidService = require("../BidService");
const BidItem = require("../../models/BidItem");
const BidCronJob = {
    /**
     * Run the crone jobs
     */
    async run() {
        await this.farmerAcceptsBidAndBuyerDelaysToRespond();
        await this.buyerDelaysToPurchaseFarmerDetails();
    },

    /**
     * Automatically re-open the auction when a buyer delays to respond 
     * after the farmer has accepted their offer.
     */
    async farmerAcceptsBidAndBuyerDelaysToRespond() {
        try {
            console.log("job 1 running...");
            const timelines = await this.getBidTimeline();
            const settings = await this.getAuctionSettings();
            timelines ? timelines.map(timeline => {
                const startDate = timeline.createdAt;
                const timeElapsed = moment.duration(moment().diff(startDate)).asMinutes();
                if (timeElapsed > settings.periodToAcceptPurchase && !timeline.acceptedPurchase) {
                    (async() => {
                        const bid = await BidItem.find({ _id: timeline.bidId });
                        await BidService.openOrCloseAuction(bid, 'open');
                    })();
                }
            }) : null;

        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Automatically re-open an auction when the buyer delays to purchase thr farmer 
     * contact details.
     */
    async buyerDelaysToPurchaseFarmerDetails() {
        try {
            console.log("job 2 running...");
            const timelines = await this.getBidTimeline(true);
            const settings = await this.getAuctionSettings();
            timelines ? timelines.map(timeline => {
                const startDate = timeline.acceptedPurchaseAt;
                const timeElapsed = moment.duration(moment().diff(startDate)).asMinutes();
                if (timeElapsed > settings.periodToPurchase && !timeline.purchasedDetails) {
                    (async() => {
                        const bid = await BidItem.find({ _id: timeline.bidId });
                        await BidService.openOrCloseAuction(bid, 'open');
                    })();
                }
            }) : null;

        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Auction settings
     * @returns AuctionSetting
     */
    async getAuctionSettings() {

        try {
            return await AuctionSetting.findOne({ settingType: 'auction' });
        } catch (error) {
            throw new Error(error);
        }
    },

    /**
     * Get the Bid Timeline
     * @param {boolean} acceptedPurchase true or false, defaults to false
     * @param {boolean} purchasedDetails true or false, defaults to false
     * @returns 
     */
    async getBidTimeline(acceptedPurchase = false, purchasedDetails = false) {
        try {
            return await BidTimeline.find({ acceptedPurchase, purchasedDetails })
                .sort({ createdAt: -1 })
                .exec();

        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = BidCronJob;