const { findLastIndex, pullAt } = require('lodash')
const data = require('../outsimple.json')
const { DateTime } = require('luxon')

const isTapOn = ({ desc }) => {
  if (desc.match(/(Pass|Purse) Use (o|O)n Entry(?! Reverse)/)) {
    return true
  } else if (desc.match(/(Pass|Purse) Use (o|O)n Entry Reverse/)) {
    return false
  } else if (desc.match(/(Pass|Purse) (Use|Rebate) (o|O)n Exit/)) {
    return false
  }
}

const isPass = ({ desc }) => {
  if (desc.match(/Pass/)) {
    return true
  } else if (desc.match(/Purse/)) {
    return false
  }
}

const betterData = data.map(item => {
  const isLightRail = (item.agency === 'SOT' &&
   !!item.desc.match(/(Pass|Purse) (Use|Rebate) (o|O)n (Entry|Exit)/)) // god why is the O sometimes capitalized
  const isRide = !!(item.desc.match(/(Pass|Purse) (Use|Rebate)/))
  return {
    ...item,
    date: DateTime.fromFormat(item.date, 'MM/dd/yyyy hh:mm a'),
    isLightRail,
    isRide,
    isTapOn: isTapOn(item),
    isPass: isPass(item)
  }
}).sort((a, b) => a.date.toMillis() - b.date.toMillis())

const lightRailTrips = []
const lightRailStack = []
// Add each tap on to a stack
// Remove the tap on when the associated tap off is found
// Matches tap on to tap off based on payment type (pass/purse) and card SN
betterData.forEach(item => {
  if (!item.isLightRail) return
  if (item.isTapOn) {
    lightRailStack.push(item)
  } else { // tap off
    const tapOnItemIndex = findLastIndex(lightRailStack, x => x.sn === item.sn && x.isPass === item.isPass) // find the last tap on from this card
    const tapOnItem = lightRailStack[tapOnItemIndex]
    pullAt(lightRailStack, [tapOnItemIndex]) // remove item from stack
    const tapOffItem = item
    // Is there a previous trip with the same time?
    // (duplicate trips happen because of pass/purse payments)
    const duplicateTripInd = lightRailTrips.findIndex(t =>
      t.tapOffTime.toMillis() === tapOffItem.date.toMillis() &&
      t.tapOnTime.toMillis() === tapOnItem.date.toMillis() &&
      t.sn === item.sn
    )
    if (lightRailTrips[duplicateTripInd]) {
      if (item.isPass) {
        lightRailTrips[duplicateTripInd].passUsed = item.isPass
      } else {
        lightRailTrips[duplicateTripInd].charged = tapOnItem.amount + tapOffItem.amount
      }
    } else {
      lightRailTrips.push({
        tapOnLocation: tapOnItem.location,
        tapOffLocation: tapOffItem.location,
        tapOnTime: tapOnItem.date,
        tapOffTime: tapOffItem.date,
        completedTrip: true,
        cancelledTrip: item.desc.includes('Reverse'), // if it is a reversal than the trip was actually cancelled
        passUsed: item.isPass,
        charged: !item.isPass ? tapOnItem.amount + tapOffItem.amount : 999,
        sn: tapOnItem.sn
      })
    }
  }
})
lightRailStack.forEach(unpairedTrip => {
  // deal with duplicate trips
  lightRailTrips.push({
    tapOnLocation: unpairedTrip.location,
    tapOffLocation: undefined,
    tapOnTime: unpairedTrip.date,
    tapOffTime: undefined,
    completedTrip: false,
    cancelledTrip: false,
    passUsed: unpairedTrip.isPass,
    charged: unpairedTrip.amount,
    sn: unpairedTrip.sn
  })
})

const busTrips = []
betterData.forEach(trip => {
  if (trip.isRide && !trip.isLightRail && trip.desc.match(/Journey/)) {
    const duplicateTripInd = busTrips.findIndex(t => t.date.toMillis() === trip.date.toMillis() && t.sn === trip.sn)
    // Merge duplicate bus trips when pass+purse is used
    if (busTrips[duplicateTripInd]) {
      if (trip.isPass) {
        busTrips[duplicateTripInd].passUsed = true
      } else {
        busTrips[duplicateTripInd].charged = trip.amount
      }
    } else {
      busTrips.push({
        location: trip.location,
        route: trip.route,
        sn: trip.sn,
        agency: trip.agency,
        charged: trip.amount ? trip.amount : 0,
        passUsed: trip.isPass,
        date: trip.date
      })
    }
  }
})
