const { getPrayerTimes } = require('./utils')

/**
 * Description
 * @param {Period} 'refer to utils/Period.js values'
 * @param {string} 'refer to file: zone.json values'
 * @returns {
 * prayerTime: Array
 * status: string
 * serverTime: string
 * periodType: string
 * lang: string
 * zone: string
 * bearing: string
 * }
 */

getPrayerTimes('today', 'SGR03')