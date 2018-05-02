from app import manager
from app.scripts import LoadMetadataCommand, LoadScCourse, LoadInflections, LoadEstablishments, LoadHeduCourse, LoadIndustries, LoadMunicipalities, LoadEconomicBlocks, LoadTerritories, LoadContinents, LoadRegions, LoadStates, LoadProducts

manager.add_command('load_metadata', LoadMetadataCommand)
manager.add_command('load_sc_course', LoadScCourse)
manager.add_command('load_inflections', LoadInflections)
manager.add_command('load_establishments', LoadEstablishments)
manager.add_command('load_hedu_course', LoadHeduCourse)
manager.add_command('load_industries', LoadIndustries)
manager.add_command('load_municipalities', LoadMunicipalities)
manager.add_command('load_economic_blocks', LoadEconomicBlocks)
manager.add_command('load_territories', LoadTerritories)
manager.add_command('load_continents', LoadContinents)
manager.add_command('load_regions', LoadRegions)
manager.add_command('load_states', LoadStates)
manager.add_command('load_products', LoadProducts)
manager.run()