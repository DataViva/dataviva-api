from app import manager
from app.scripts import LoadMetadataCommand

manager.add_command('loadmetadata', LoadMetadataCommand)
manager.run()