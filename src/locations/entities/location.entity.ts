import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    type: string;

    @ManyToOne(() => Location, (loc) => loc.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Location;

    @OneToMany(() => Location, (loc) => loc.parent)
    children: Location[];

    @ManyToOne(() => User, { nullable: true, eager: true })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
