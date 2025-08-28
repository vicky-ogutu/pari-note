import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Location } from '../../locations/entities/location.entity';

@Entity('pari_note_reports')
export class PariNote {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'facility_id' })
    facility: Location;

    @Column({ type: 'date' })
    dateOfReport: string;

    @Column({ type: 'enum', enum: ['male', 'female', 'unknown'], default: 'unknown' })
    babySex: string;

    @Column('decimal', { precision: 5, scale: 2 })
    birthWeight: number;

    @Column()
    gestationWeeks: number;

    @Column('text')
    causeOfDeath: string;

    @Column()
    motherAge: number;

    @Column('text', { nullable: true })
    remarks: string;

    @Column({ default: 'submitted' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
