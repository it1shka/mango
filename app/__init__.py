'''Front-end implemented in Tkinter'''


from core import Client
from .interface import Interface
from .controller import Controller


def run(client: Client) -> None:
    '''
    Creates interface and controller for it.
    Runs the application
    '''
    interface = Interface()
    controller = Controller(client, interface)
    controller.start()
