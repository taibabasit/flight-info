import { Component, OnInit } from '@angular/core';
import { FlightService } from '../flight.service';
import * as moment from 'moment-timezone';


@Component({
  selector: 'flight-info-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.css'],
})
export class FlightComponent implements OnInit {
  constructor(private flightService:FlightService) {}

  flights:any[] = [];
  ngOnInit() {
    this.flightService.getFlights().subscribe((res:any) => {
      this.flights = res.flights;
      for (const flight of this.flights) {
        flight.slices[0].arrival_date_time_utc = moment(flight.slices[0].arrival_date_time_utc).format('DD-MM-YYYY HH:mm:ss');
        flight.slices[0].departure_date_time_utc = moment(flight.slices[0].departure_date_time_utc).format('DD-MM-YYYY HH:mm:ss');
        flight.slices[1].arrival_date_time_utc = moment(flight.slices[1].arrival_date_time_utc).format('DD-MM-YYYY HH:mm:ss');
        flight.slices[1].departure_date_time_utc = moment(flight.slices[1].departure_date_time_utc).format('DD-MM-YYYY HH:mm:ss');
      }
      console.log(this.flights);
    });
  }
}
