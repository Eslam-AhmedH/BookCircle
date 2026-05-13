import { useAsync } from '../../shared/lib/useAsync'
import { requestsService } from '../../services'
import { useSocketEvent } from '../socket/useSocket'

export const useIncomingRequests = () => {
  const state = useAsync(() => requestsService.getIncoming(), [])
  
  // Real-time updates for incoming requests
  useSocketEvent("borrow_request_new", () => {
    void state.refetch(true);
  });
  
  return state;
}

export const useMyRequests = () => {
  const state = useAsync(() => requestsService.getMyRequests(), [])
  
  // Real-time updates for outgoing requests
  useSocketEvent("borrow_request_accepted", () => {
    void state.refetch(true);
  });
  
  useSocketEvent("borrow_request_rejected", () => {
    void state.refetch(true);
  });
  
  return state;
}
