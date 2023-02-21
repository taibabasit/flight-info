import { Component, OnInit } from '@angular/core';
import { FlightService } from '../flight.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'flight-info-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.css'],
})
export class FlightComponent implements OnInit {
  constructor(private flightService:FlightService) {}

  // displayedColumns: string[] = ['flight_no', 'origin', 'destination', 'arrival_date_time_utc', 'departure_date_time_utc'];
  // dataSource:MatTableDataSource<any[]>= new MatTableDataSource<any[]>([]);

  // getFlights() {
  //   this.flightService.getFlights().subscribe((res:any) => {
  //   this.dataSource = res.flights;
  //   return res.flights;
  //   });
  // }
  // ngOnInit() {   

  //   this.getFlights();
  //   console.log(this.dataSource);
  // }

  flights:any[] = [];
  ngOnInit() {
    this.flightService.getFlights().subscribe((res:any) => {
      this.flights = res.flights;
      console.log(this.flights);
    });
  }
}
