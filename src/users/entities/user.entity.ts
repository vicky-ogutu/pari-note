import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column()
    role: string;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'location_id' })
    location: Location;
}
