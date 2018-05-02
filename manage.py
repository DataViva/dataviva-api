from app import manager
from app.scripts import LoadMetadataCommand, LoadScCourse, LoadInflections, LoadEstablishments, LoadHeduCourse, LoadIndustries

manager.add_command('load_metadata', LoadMetadataCommand)
manager.add_command('load_sc_course', LoadScCourse)
manager.add_command('load_inflections', LoadInflections)
manager.add_command('load_establishments', LoadEstablishments)
manager.add_command('load_hedu_course', LoadHeduCourse)
manager.add_command('load_industries', LoadIndustries)
manager.run()