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

/**
 * Get localized status message
 * Use this in React components with useMessages()
 * @param status The status code from RPC
 * @param messages Messages object from useMessages()
 */
export function getStatusMessage(status: string, messages: any): string {
  const errors = messages.lib.rpcErrors as Record<string, string | ((s: string) => string)>
  const msg = errors[status]
  if (typeof msg === 'function') {
    return msg(status)
  }
  return msg || messages.lib.rpcErrors.operation_failed(status)
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
        // Status code, translate at call site
        message: 'generic_failure',
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
        // Status code, translate at call site using getStatusMessage
        message: status,
      }
    }
  }
  
  // 기타 (단순 값 반환)
  return {
    ok: true,
    data: data as T,
  }
}
