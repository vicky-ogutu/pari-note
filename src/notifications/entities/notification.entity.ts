import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { PariNote } from 'src/reports/entities/pari-note.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => PariNote)
    @JoinColumn({ name: 'report_id' })
    report: PariNote;

    @Column('text')
    message: string;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @CreateDateColumn()
    createdAt: Date;
}
