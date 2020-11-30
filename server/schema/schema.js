const graphql = require('graphql');
const _ = require('lodash');
const ToDo = require('../models/todo');
const List = require('../models/list');

const { 
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const ToDoType = new GraphQLObjectType({
  name: 'ToDo',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
    listId: { type: GraphQLID }
  })
});

const ListType = new GraphQLObjectType({
  name: 'List',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    todos: {
      type: new GraphQLList(ToDoType),
      resolve(parent, args) {
        return ToDo.find({ listId: parent.id })
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    todo: {
      type: ToDoType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        return ToDo.findById(args.id);
      }
    },
    list: {
      type: ListType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        return List.findById(args.id);
      }
    },
    lists: {
      type: new GraphQLList(ListType),
      resolve(parent, args) {
        return List.find({});
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addList: {
      type: ListType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        let list = new List({
          name: args.name
        });
        return list.save();
      }
    },
    addTodo: {
      type: ToDoType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        completed: { type: new GraphQLNonNull(GraphQLBoolean) },
        listId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        let todo = new ToDo({
          name: args.name,
          completed: args.completed,
          listId: args.listId
        });
        return todo.save();
      }
    },
    updateTodo: {
      type: ToDoType,
      args: { id: { type: GraphQLID }, completed: { type: GraphQLBoolean }},
      resolve(parent, args) {
        return ToDo.findByIdAndUpdate(args.id, { completed: args.completed }, { new: true });
      }
    },
    removeTodo: {
      type: ToDoType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        return ToDo.findByIdAndDelete(args.id);
      }
    },
    removeList: {
      type: ListType,
      args: { id: { type: GraphQLID }},
      resolve(parent, args) {
        List.findByIdAndDelete(args.id, (err, response) => {
          ToDo.deleteMany({ listId: args.id }, (err, result) => {
            return result;
          });
        });
        return List;
      }
    },
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})