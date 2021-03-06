import abc
import logging

from cliff import command
from cliff import lister
from cliff import show
import six

from testapiclient import utils


class CommandMeta(abc.ABCMeta):

    def __new__(mcs, name, bases, cls_dict):
        if 'log' not in cls_dict:
            cls_dict['log'] = logging.getLogger(
                cls_dict['__module__'] + '.' + name)
        return super(CommandMeta, mcs).__new__(mcs, name, bases, cls_dict)


@six.add_metaclass(CommandMeta)
class Command(command.Command):
    def run(self, parsed_args):
        self.log.debug('run(%s)', parsed_args)
        return super(Command, self).run(parsed_args)


class Lister(Command, lister.Lister):
    @staticmethod
    def format_output(columns, data):
        return (columns,
                (utils.get_item_properties(s, columns) for s in data))


class ShowOne(Command, show.ShowOne):
    @staticmethod
    def format_output(body):
        return zip(*sorted(six.iteritems(body)))
