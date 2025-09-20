import { User, BaseUser } from './user/User';
import { UserRole } from '@prisma/client';
import { Coordenador } from './roles/Coordenador';
import { Gerente } from './roles/Gerente';
import { Laboratorista } from './roles/Laboratorista';
import { GerenteProjeto } from './roles/GerenteProjeto';
import { Pesquisador } from './roles/Pesquisador';
import { Colaborador } from './roles/Colaborador';
import { Voluntario } from './roles/Voluntario';

export class UserFactory {
    static createFromRole(role: UserRole, baseUser: BaseUser): User {
        switch (role) {
            case 'COORDENADOR':
                return new Coordenador(baseUser);
            case 'GERENTE':
                return new Gerente(baseUser);
            case 'LABORATORISTA':
                return new Laboratorista(baseUser);
            case 'GERENTE_PROJETO':
                return new GerenteProjeto(baseUser);
            case 'PESQUISADOR':
                return new Pesquisador(baseUser);
            case 'COLABORADOR':
                return new Colaborador(baseUser);
            case 'VOLUNTARIO':
                return new Voluntario(baseUser);
            default:
                return baseUser;
        }
    }

    static createWithRole(role: UserRole, data: any): User {
        const baseUser = new BaseUser(data);
        return this.createFromRole(role, baseUser);
    }
}