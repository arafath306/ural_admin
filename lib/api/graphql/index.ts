// Complete GraphQL mock exports for Supabase migration
export const dummyQueryDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'DummyQuery' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

export const dummyMutationDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DummyMutation' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

export const dummySubscriptionDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'DummySubscription' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: '__typename' } }],
      },
    },
  ],
};

export const dummyDoc = dummyQueryDoc;

export const gql = (strings: any, ...args: any[]) => {
  const queryStr = Array.isArray(strings) ? strings.join('') : String(strings);
  if (/mutation\b/i.test(queryStr)) return dummyMutationDoc;
  if (/subscription\b/i.test(queryStr)) return dummySubscriptionDoc;
  return dummyQueryDoc;
};

export class ApolloError extends Error {
  networkError?: any;
  graphQLErrors?: any[];
  constructor(message?: string) {
    super(message || 'ApolloError');
    this.name = 'ApolloError';
    this.graphQLErrors = [];
  }
}

export const dummyUseQuery = (query?: any, options?: any): any => ({
  data: undefined,
  loading: false,
  error: undefined,
  refetch: async () => ({ data: undefined }),
  fetchMore: async () => ({ data: undefined }),
  startPolling: () => {},
  stopPolling: () => {},
});

export const dummyUseMutation = (mutation?: any, options?: any): any => {
  const mutate = async (variables?: any) => {
    if (options?.onCompleted) {
      try {
        options.onCompleted({});
      } catch (e) {
        console.warn('onCompleted error in mock mutation:', e);
      }
    }
    return { data: {} };
  };
  return [mutate, { loading: false, error: undefined, data: undefined, reset: () => {} }];
};

export const dummyUseSubscription = (subscription?: any, options?: any): any => ({
  data: undefined,
  loading: false,
  error: undefined,
});

export const useQuery = dummyUseQuery;
export const useMutation = dummyUseMutation;
export const useQueryGQL = dummyUseQuery;
export const useSubscription = dummyUseSubscription;

// Mutations (operation: 'mutation')
export const CREATE_FOOD = dummyMutationDoc;
export const CREATE_RESTAURANT = dummyMutationDoc;
export const CREATE_RESTAURANT_COUPON = dummyMutationDoc;
export const CREATE_STAFF = dummyMutationDoc;
export const CREATE_SUB_CATEGORIES = dummyMutationDoc;
export const CREATE_TICKET_MESSAGE = dummyMutationDoc;
export const CREATE_VENDOR = dummyMutationDoc;
export const CREATE_WITHDRAW_REQUEST = dummyMutationDoc;
export const CREATE_ZONE = dummyMutationDoc;
export const DELETE_RESTAURANT = dummyMutationDoc;
export const HARD_DELETE_RESTAURANT = dummyMutationDoc;
export const DELETE_RESTAURANT_COUPON = dummyMutationDoc;
export const DELETE_STAFF = dummyMutationDoc;
export const DELETE_USER = dummyMutationDoc;
export const DELETE_VENDOR = dummyMutationDoc;
export const DELETE_ZONE = dummyMutationDoc;
export const DUPLICATE_RESTAURANT = dummyMutationDoc;
export const EDIT_FOOD = dummyMutationDoc;
export const EDIT_RESTAURANT = dummyMutationDoc;
export const EDIT_RESTAURANT_COUPON = dummyMutationDoc;
export const EDIT_STAFF = dummyMutationDoc;
export const EDIT_VENDOR = dummyMutationDoc;
export const EDIT_ZONE = dummyMutationDoc;
export const MARK_WEB_NOTIFICATIONS_AS_READ = dummyMutationDoc;
export const RESET_USER_SESSION = dummyMutationDoc;
export const SAVE_AMPLITUDE_API_KEY_CONFIGURATION = dummyMutationDoc;
export const SAVE_APP_CONFIGURATION = dummyMutationDoc;
export const SAVE_CLOUDINARY_CONFIGURATION = dummyMutationDoc;
export const SAVE_EMAIL_CONFIGURATION = dummyMutationDoc;
export const SAVE_FIREBASE_CONFIGURATION = dummyMutationDoc;
export const SAVE_GOOGLE_API_KEY_CONFIGURATION = dummyMutationDoc;
export const SAVE_GOOGLE_CLIENT_ID_CONFIGURATION = dummyMutationDoc;
export const SAVE_PAYPAL_CONFIGURATION = dummyMutationDoc;
export const SAVE_SENTRY_CONFIGURATION = dummyMutationDoc;
export const SAVE_STRIPE_CONFIGURATION = dummyMutationDoc;
export const SAVE_TWILIO_CONFIGURATION = dummyMutationDoc;
export const SAVE_VERIFICATION_CONFIGURATION = dummyMutationDoc;
export const SEND_NOTIFICATION_USER = dummyMutationDoc;
export const SET_VERSIONS = dummyMutationDoc;
export const UPDATE_DELIVERY_BOUNDS_AND_LOCATION = dummyMutationDoc;
export const UPDATE_DELIVERY_OPTIONS = dummyMutationDoc;
export const UPDATE_RESTAURANT_BUSSINESS_DETAILS = dummyMutationDoc;
export const UPDATE_RESTAURANT_DELIVERY = dummyMutationDoc;
export const UPDATE_TICKET_STATUS = dummyMutationDoc;
export const UPDATE_TIMINGS = dummyMutationDoc;
export const UPDATE_USER_NOTES = dummyMutationDoc;
export const UPDATE_USER_STATUS = dummyMutationDoc;
export const UPDATE_WITHDRAW_REQUEST = dummyMutationDoc;
export const UPLOAD_TOKEN = dummyMutationDoc;
export const UPLOAD_IMAGE_TO_S3 = dummyMutationDoc;

// Subscriptions (operation: 'subscription')
export const RIDER_UPDATED_SUBSCRIPTION = dummySubscriptionDoc;

// Queries (operation: 'query')
export const GET_ALL_WITHDRAW_REQUESTS = dummyQueryDoc;
export const GET_AUDIT_LOGS = dummyQueryDoc;
export const GET_CATEGORY_BY_RESTAURANT_ID = dummyQueryDoc;
export const GET_CLONED_RESTAURANTS = dummyQueryDoc;
export const GET_CONFIGURATION = dummyQueryDoc;
export const GET_CUISINES = dummyQueryDoc;
export const GET_DASHBOARD_SALES_BY_TYPE = dummyQueryDoc;
export const GET_DASHBOARD_USERS_BY_YEAR = dummyQueryDoc;
export const GET_FOODS_BY_RESTAURANT_ID = dummyQueryDoc;
export const GET_ORDERS_BY_USER = dummyQueryDoc;
export const GET_RESTAURANTS = dummyQueryDoc;
export const GET_RESTAURANTS_BY_OWNER = dummyQueryDoc;
export const GET_RESTAURANT_DASHBOARD_ORDER_SALES_DETAILS_BY_PAYMENT_METHOD = dummyQueryDoc;
export const GET_RESTAURANT_DELIVERY_ZONE_INFO = dummyQueryDoc;
export const GET_RESTAURANT_PROFILE = dummyQueryDoc;
export const GET_SUBCATEGORIES = dummyQueryDoc;
export const GET_SUBCATEGORIES_BY_PARENT_ID = dummyQueryDoc;
export const GET_TICKET_USERS_WITH_LATEST = dummyQueryDoc;
export const GET_USERS_PAGINATED = dummyQueryDoc;
export const GET_USER_BY_ID = dummyQueryDoc;
export const GET_USER_SUPPORT_TICKETS = dummyQueryDoc;
export const GET_VENDORS = dummyQueryDoc;
export const GET_VENDOR_BY_ID = dummyQueryDoc;
export const GET_VERSIONS = dummyQueryDoc;
export const GET_WEB_NOTIFICATIONS = dummyQueryDoc;
export const GET_ZONES = dummyQueryDoc;

export default dummyQueryDoc;
