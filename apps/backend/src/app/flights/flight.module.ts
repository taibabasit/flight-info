import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { FlightController } from "./flight.controller";
import { FlightService } from "./flight.service";

@Module({
    imports: [HttpModule],
    controllers: [FlightController],
    providers: [FlightService]
})
export class FlightModule {}