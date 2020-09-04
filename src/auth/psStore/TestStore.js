import { Store } from "pullstate";

// testing if i can dynamically add fields to the store
// testing if i can dynamically have useState give me changes of a single value of obj or array

export const TestStore = new Store({

    //objs:{ 'a5': { 'name':'beep'} },
    objs:{}

})


/*
auth: // is in an AuthStore


// structure of bidding store:

objs: {}    // bidUpdate data coming in via SSE

myBids: {}
catalog: {}

auctionStatus: {}  // retired, restarted, paused items, started/stopped auction

leading: {}
loosing: {}
hearted: {}

auctionInfo: {}

me: {}  // my bids, my hearted  (replicates stuff from above.. so probably not using it)

*/