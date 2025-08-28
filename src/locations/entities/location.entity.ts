import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

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
}
