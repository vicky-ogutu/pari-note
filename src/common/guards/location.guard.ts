import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { LocationsService } from 'src/locations/locations.service';

@Injectable()
export class LocationGuard implements CanActivate {
    constructor(private readonly locService: LocationsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        const targetId = request.params.locationId || request.body.locationId;
        if (!targetId) return false;

        const accessible = await this.locService.getAccessibleLocationIds(user.location.id);
        return accessible.includes(Number(targetId));
    }
}
