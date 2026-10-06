import { supabase } from './supabaseClient'

/**
 * RPC 응답 정규화 헬퍼
 * - `{success: true, ...}` 형식 (create_group 등)
 * - `{status: 'success', ...}` 형식 (approve_join_request 등)
 * - Supabase 에러
 * 를 하나의 타입으로 통일
 */

export type RpcSuccess<T = Record<string, unknown>> = {
  ok: true
  data: T
}

export type RpcError = {
  ok: false
  status: string
  message: string
}

export type RpcResult<T = Record<string, unknown>> = RpcSuccess<T> | RpcError

const STATUS_MESSAGES: Record<string, string> = {
  // 공통
  not_authorized: '권한이 없습니다',
  not_found: '찾을 수 없습니다',
  
  // 가입 요청
  already_processed: '이미 처리된 요청입니다',
  banned: '차단된 사용자입니다',
  user_not_found: '사용자를 찾을 수 없습니다',
  already_member: '이미 멤버입니다',
  
  // 역할 변경
  not_member: '멤버를 찾을 수 없습니다',
  invalid_role: '잘못된 역할입니다',
  cannot_change_own_role: '자신의 역할은 변경할 수 없습니다',
  cannot_change_owner: '그룹장 역할은 변경할 수 없습니다',
  
  // 멤버 제거
  cannot_remove_self: '자신을 내보낼 수 없습니다',
  cannot_remove_owner_or_admin: '관리자는 그룹장이나 다른 관리자를 내보낼 수 없습니다',
  
  // 소유권 이전
  not_owner: '그룹장만 가능한 작업입니다',
  invalid_target: '유효하지 않은 대상입니다',
  
  // 초대
  archived: '보관된 그룹입니다',
  expired: '만료된 초대입니다',
  too_many_groups: '가입 가능한 그룹 수를 초과했습니다',
  
  // 가입
  not_invited: '초대받지 않았습니다',
  invalid_code: '유효하지 않은 초대 코드입니다',
}

export function getStatusMessage(status: string): string {
  return STATUS_MESSAGES[status] || `작업 실패 (${status})`
}

/**
 * Supabase RPC 호출을 정규화된 결과로 반환
 * 
 * @param rpcName RPC 함수 이름
 * @param args RPC 인자
 * @returns 정규화된 RpcResult
 */
export async function callRpc<T = Record<string, unknown>>(
  rpcName: string,
  args?: Record<string, unknown>
): Promise<RpcResult<T>> {
  const { data, error } = await supabase.rpc(rpcName, args)
  
  // Supabase 에러 (네트워크, 권한, SQL 에러 등)
  if (error) {
    return {
      ok: false,
      status: 'error',
      message: error.message,
    }
  }
  
  // data가 null/undefined (void 함수)
  if (!data) {
    return {
      ok: true,
      data: {} as T,
    }
  }
  
  // {success: true, ...} 형식
  if (typeof data === 'object' && 'success' in data) {
    if (data.success === true) {
      return {
        ok: true,
        data: data as T,
      }
    } else {
      return {
        ok: false,
        status: 'failed',
        message: '작업 실패',
      }
    }
  }
  
  // {status: '...', ...} 형식
  if (typeof data === 'object' && 'status' in data) {
    const status = String(data.status)
    if (status === 'success') {
      return {
        ok: true,
        data: data as T,
      }
    } else {
      return {
        ok: false,
        status,
        message: getStatusMessage(status),
      }
    }
  }
  
  // 기타 (단순 값 반환)
  return {
    ok: true,
    data: data as T,
  }
}
