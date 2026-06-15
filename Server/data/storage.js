const dataStorage = {
    sensorData: { nhietdo: 0, doamkk: 0, doamdat: 0, anhsang: 0 },
    control: { bom: 0, phunsuong: 0, den: 0, quat: 0, manche:0 },
    system: { mode: 0 },
    thresholds: { temperatureUpper: 0, humidityUpper: 0, soilMoistureUpper: 0, lightIntensityUpper: 0 ,
                  temperatureLower: 0, humidityLower: 0, soilMoistureLower: 0, lightIntensityLower: 0  }
 };
 module.exports = dataStorage;