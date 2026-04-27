import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { read } from 'shapefile'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const shpPath = path.join(rootDir, 'ACRESHAPE', 'AC_Municipios_2024.shp')
const dbfPath = path.join(rootDir, 'ACRESHAPE', 'AC_Municipios_2024.dbf')
const outputDir = path.join(rootDir, 'public', 'shapefiles')
const outputPath = path.join(outputDir, 'acre-municipios.geojson')
const dbfEncoding = process.env.SHAPEFILE_DBF_ENCODING ?? 'latin1'

const geoJson = await read(shpPath, dbfPath, { encoding: dbfEncoding })

await mkdir(outputDir, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(geoJson, null, 2)}\n`, 'utf8')

console.log(
	`[sync:shapefile] GeoJSON atualizado em ${path.relative(rootDir, outputPath)} (encoding: ${dbfEncoding})`,
)
