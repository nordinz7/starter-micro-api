const axios = require('axios');
const https = require('https')

const Period = {
  Today: 'today',
  Week: 'week',
  Month: 'month',
  Year: 'year',
  Duration: 'duration'
}

const getZones = () => {
  return new Promise((resolve, reject) => {
    const url = "https://www.e-solat.gov.my/index.php?siteId=24&pageId=24";
    https.get(url, (res) => {
      let result = '';
      res.on('data', (chunk) => {
        result += chunk;
      });
      res.on('end', () => {
        const pattern = /<select id="inputZone" class="form-control">([\w\W]*?)<\/select>/;
        const matches = result.match(pattern);
        const pattern2 = /<optgroup([\w\W]*?)<\/optgroup>/g;
        const stateJson = matches[1].match(pattern2).reduce((acc, zone) => {
          const statePattern = /label="([\w\W]*?)"/;
          const state = zone.match(statePattern)[1];

          const zonePattern = /<option.*?value='([\w\W]*?)'.*?>([\w\W]*?)<\/option>/g;
          const zonJson = Array.from(zone.matchAll(zonePattern)).reduce((acc, matches) => {
            const zonecode = matches[1];
            const zonename = matches[2].replace(/<\/?[^>]+(>|$)/g, '').split(" - ")[1];
            acc[zonecode] = zonename;
            return acc;
          }, {});

          acc[state] = zonJson;
          return acc;
        }, {});

        resolve(stateJson);
      });
    }).on('error', (err) => {
      reject(new Error(err.message));
    });
  });
};




const parseQuery = async (period, zone) => {
  if (typeof period !== 'string' || typeof zone !== 'string') throw new Error('period or zone must be a string')

  if (!Object.values(Period).includes(period)) throw new Error('period must be one of today, week, month, year, duration')

  let zones

  await getZones().then((stateJson) => {
    zones = stateJson
  }).catch((err) => {
    console.error(err);
  });

  const stateKeys = Object.values(zones).map(i => Object.keys(i)).reduce((acc, curr) => [...acc, ...curr], [])
  if (!stateKeys.includes(zone)) throw new Error('invalid state key')

  return {
    period,
    zone
  }
}

const getPrayerTimes = async (period = Period.Today, zone) => {
  await parseQuery(period, zone)
  const url = `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=${period}&zone=${zone}`;
  await axios.post(url,
    { datestart: 'YYYY-MM-DD', dateend: 'YYYY-MM-DD' }
  ).then(response => console.log('--------response', response.data))
    .catch(error => console.error(error));
}

module.exports = {
  Period,
  parseQuery,
  getPrayerTimes,
  getZones
}