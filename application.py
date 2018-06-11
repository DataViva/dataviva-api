from app import flask as application


@application.route("/health_check")
def health_check():
    return 'ready', 200

if __name__ == "__main__":
    application.run()
