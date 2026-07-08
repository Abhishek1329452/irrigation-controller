const zoneIds = [0, 1, 2, 3]

const zoneProfiles = [
  { moistureBase: 42, tempBase: 24, humidityBase: 58, waterBase: 120 },
  { moistureBase: 55, tempBase: 22, humidityBase: 63, waterBase: 85 },
  { moistureBase: 36, tempBase: 25, humidityBase: 52, waterBase: 145 },
  { moistureBase: 61, tempBase: 23, humidityBase: 66, waterBase: 70 },
]

function wave(seed: number, offset = 0) {
  return Math.sin(Date.now() / 600000 + seed + offset)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function readingForZone(zoneId: number, timestamp = new Date()) {
  const profile = zoneProfiles[zoneId]
  const seed = zoneId * 1.7
  const moisture = clamp(profile.moistureBase + wave(seed) * 9, 18, 88)
  const temperature = clamp(profile.tempBase + wave(seed, 1.5) * 3, 12, 35)
  const humidity = clamp(profile.humidityBase + wave(seed, 2.5) * 8, 28, 90)
  const waterPrediction = clamp((70 - moisture) * 8, 0, 420)

  return {
    timestamp: timestamp.toISOString(),
    soil_moisture: Number(moisture.toFixed(1)),
    temperature: Number(temperature.toFixed(1)),
    humidity: Number(humidity.toFixed(1)),
    water_applied: Number((profile.waterBase + Math.max(0, 45 - moisture) * 6).toFixed(1)),
    water_prediction: Number(waterPrediction.toFixed(1)),
  }
}

function currentPayload() {
  const data = Object.fromEntries(zoneIds.map((zoneId) => [zoneId, readingForZone(zoneId)]))
  const activeZones = zoneIds.filter((zoneId) => data[zoneId].soil_moisture < 35)

  return {
    data,
    status: {
      online: true,
      active_zones: activeZones,
      pump_running: activeZones.length > 0,
    },
  }
}

function historicalPayload(hours: number) {
  const points = Math.min(50, Math.max(8, hours * 2))
  const now = Date.now()
  const interval = (hours * 60 * 60 * 1000) / points

  return Object.fromEntries(
    zoneIds.map((zoneId) => [
      zoneId,
      Array.from({ length: points }, (_, index) => {
        const timestamp = new Date(now - (points - index - 1) * interval)
        return readingForZone(zoneId, timestamp)
      }),
    ]),
  )
}

function statsPayload(hours: number) {
  const history = historicalPayload(hours)
  const total = Object.values(history).reduce((sum, readings) => {
    return sum + readings.reduce((zoneSum, reading) => zoneSum + reading.water_applied, 0)
  }, 0)

  return {
    hours,
    total_water_applied: Number(total.toFixed(0)),
    active_zones: currentPayload().status.active_zones,
    pump_running: currentPayload().status.pump_running,
  }
}

export default async (req: Request) => {
  const url = new URL(req.url)
  const hours = Number(url.searchParams.get('hours') || 24)

  if (url.pathname === '/api/current') {
    return Response.json(currentPayload())
  }

  if (url.pathname === '/api/sensor-data') {
    return Response.json(historicalPayload(Number.isFinite(hours) ? hours : 24))
  }

  if (url.pathname === '/api/stats') {
    return Response.json(statsPayload(Number.isFinite(hours) ? hours : 24))
  }

  return Response.json({ error: 'Not found' }, { status: 404 })
}

export const config = {
  path: '/api/*',
}
