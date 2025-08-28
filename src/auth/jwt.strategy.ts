import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'jwt_secret_dev',
        });
    }

    async validate(payload: any): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
