"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  Target, 
  Clock, 
  Mail, 
  Calendar,
  Star,
  ArrowLeft,
  User as UserIcon
} from "lucide-react"
import { User as UserType, UserBadge } from "@/contexts/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UserProfileViewProps {
  user: UserType
  onBack: () => void
  canEdit?: boolean
  onEdit?: () => void
}

// Helper function to safely format dates
const safeFormatDistance = (date: string | Date | null | undefined, fallback: string = 'Data não disponível') => {
  if (!date) return fallback
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return fallback
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
  } catch {
    return fallback
  }
}

export function UserProfileView({ user, onBack, canEdit = false, onEdit }: UserProfileViewProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'COORDENADOR': 'bg-purple-100 text-purple-800 border-purple-200',
      'GERENTE': 'bg-blue-100 text-blue-800 border-blue-200',
      'LABORATORISTA': 'bg-green-100 text-green-800 border-green-200',
      'PESQUISADOR': 'bg-orange-100 text-orange-800 border-orange-200',
      'GERENTE_PROJETO': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'COLABORADOR': 'bg-gray-100 text-gray-800 border-gray-200',
      'VOLUNTARIO': 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde {safeFormatDistance(user.createdAt)}</span>
                </div>
              </div>
            </div>
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <UserIcon className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bio */}
          {user.bio && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Sobre</h3>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-900">{user.points}</div>
              <div className="text-xs text-blue-700">Pontos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-900">{user.completedTasks}</div>
              <div className="text-xs text-green-700">Tarefas</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-orange-900">{user.weekHours}</div>
              <div className="text-xs text-orange-700">Horas/Sem</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-900">{user.roles.length}</div>
              <div className="text-xs text-purple-700">Funções</div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Funções</h3>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <Badge 
                  key={role} 
                  variant="outline" 
                  className={`${getRoleColor(role)} border`}
                >
                  {role.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Conquistas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {user.badges.map((userBadge) => (
                  <div 
                    key={userBadge.id} 
                    className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex-shrink-0">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-yellow-900">
                        {userBadge.badge.name}
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        {userBadge.badge.description}
                      </div>
                      <div className="text-xs text-yellow-600 mt-1">
                        Conquistado {safeFormatDistance(userBadge.earnedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

