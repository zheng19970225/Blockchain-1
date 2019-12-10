import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('user')
export class User {
  /**
   * 系统内部唯一 ID
   */
  @PrimaryColumn('int', { name: 'uid' })
  public uid!: number;

  /**
   * 统一社会信用代码
   */
  @Index('uscc', { unique: true })
  @PrimaryColumn('varchar', { name: 'uscc', length: 18 })
  public uscc: string;

  /**
   * 公钥地址
   */
  @Index('address', { unique: true })
  @PrimaryColumn('varchar', { name: 'address', length: 40 })
  public address: string;

  /**
   * 用户密码
   */
  @Column('varchar', { name: 'password', length: 128 })
  public password: string;

  /**
   * 用户类型
   */
  @Column('int', { name: 'type' })
  public type: number;
}
