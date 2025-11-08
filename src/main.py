from .api import app
from .database import init_db

# ensure DB exists
init_db()


if __name__ == "__main__":
    # host and port are passed to the framework; types are framework-defined
    app.start(host="0.0.0.0", port=8080)
