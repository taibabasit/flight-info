import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(private webReqService:WebRequestService) { }

  getFlights() {
    return this.webReqService.get('flights');
  }
}
