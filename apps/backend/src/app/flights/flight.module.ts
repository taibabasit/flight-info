import { Module, CacheModule } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { FlightController } from "./flight.controller";
import { FlightService } from "./flight.service";

@Module({
    imports: [HttpModule, CacheModule.register({ttl: 3600})],
    controllers: [FlightController],
    providers: [FlightService]
})
export class FlightModule {}