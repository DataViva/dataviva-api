from app import manager
from app.scripts import LoadMetadataCommand, LoadScCourse

manager.add_command('loadmetadata', LoadMetadataCommand)
manager.add_command('load_sc_course', LoadScCourse)
manager.run()