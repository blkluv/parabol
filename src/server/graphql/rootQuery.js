import {GraphQLObjectType} from 'graphql';
import cachedUser from './models/CachedUser/cachedUserQuery';
import meeting from './models/Meeting/meetingQuery'

const rootFields = {cachedUser, meeting};

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
