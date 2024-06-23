'''Entry point of the application'''


from core import Client
import app


if __name__ == '__main__':
    with Client() as client:
        app.run(client)
