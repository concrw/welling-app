import { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { supabase } from '../lib/supabaseClient'

interface Member {
  id: string
  nickname: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

interface JoinRequest {
  id: string
  user_id: string
  nickname: string
  requested_at: string
}

export default function CommunitySettings() {
  const goBack = useAppStore((s) => s.goBack)
  const selectedCommunity = useAppStore((s) => s.selectedCommunity)
  const userId = useAppStore((s) => s.userId)
  const navigate = useAppStore((s) => s.navigate)
  
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([])
  const [myRole, setMyRole] = useState<'owner' | 'admin' | 'member'>('member')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'invite' | 'members' | 'requests'>('invite')
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)
  const [transferTarget, setTransferTarget] = useState<Member | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (!selectedCommunity || !userId) return
    loadSettings()
    loadMuteStatus()
  }, [selectedCommunity, userId])

  const loadMuteStatus = async () => {
    if (!selectedCommunity || !userId) return
    
    // Load server-side mute status
    const { data } = await supabase
      .from('community_members')
      .select('notifications_muted')
      .eq('community_id', selectedCommunity.id)
      .eq('user_id', userId)
      .single()
    
    setIsMuted(data?.notifications_muted ?? false)
  }

  const loadSettings = async () => {
    if (!selectedCommunity) return
    
    setLoading(true)
    
    // Load community details
    const { data: commData } = await supabase
      .from('communities')
      .select('invite_code, requires_approval')
      .eq('id', selectedCommunity.id)
      .single()
    
    if (commData) {
      setInviteUrl(`${window.location.origin}/?invite=${commData.invite_code}`)
      setRequiresApproval(commData.requires_approval ?? false)
    }
    
    // Load members
    const { data: memberData } = await supabase
      .from('community_members')
      .select('user_id, role, joined_at, profiles(nickname)')
      .eq('community_id', selectedCommunity.id)
      .order('joined_at', { ascending: true })
    
    if (memberData) {
      const membersList: Member[] = memberData.map((m: any) => ({
        id: m.user_id,
        nickname: m.profiles?.nickname ?? 'Unknown',
        role: m.role,
        joined_at: m.joined_at,
      }))
      setMembers(membersList)
      
      const me = membersList.find((m) => m.id === userId)
      if (me) setMyRole(me.role)
    }
    
    // Load pending requests if approval required
    if (commData?.requires_approval) {
      const { data: requestData } = await supabase
        .from('community_join_requests')
        .select('id, user_id, requested_at, profiles(nickname)')
        .eq('community_id', selectedCommunity.id)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true })
      
      if (requestData) {
        const requestsList: JoinRequest[] = requestData.map((r: any) => ({
          id: r.id,
          user_id: r.user_id,
          nickname: r.profiles?.nickname ?? 'Unknown',
          requested_at: r.requested_at,
        }))
        setPendingRequests(requestsList)
      }
    }
    
    setLoading(false)
  }

  const handleCopy = async () => {
    const shareText = `${selectedCommunity?.name} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n${inviteUrl}`
    
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    const shareText = `${selectedCommunity?.name} 그룹에 초대합니다!\n\n함께 건강한 습관을 만들어요 💪\n\n${inviteUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedCommunity?.name} 그룹 초대`,
          text: shareText,
          url: inviteUrl,
        })
      } catch {
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const handleRotate = async () => {
    if (!selectedCommunity) return
    setRotating(true)
    
    const { error } = await supabase.rpc('rotate_invite_code', {
      p_community_id: selectedCommunity.id,
    })
    
    if (!error) {
      await loadSettings()
    }
    setRotating(false)
  }

  const handleToggleApproval = async () => {
    if (!selectedCommunity || myRole !== 'owner') return
    
    const { error } = await supabase
      .from('communities')
      .update({ requires_approval: !requiresApproval })
      .eq('id', selectedCommunity.id)
    
    if (!error) {
      setRequiresApproval(!requiresApproval)
    }
  }

  const handleApproveRequest = async (requestId: string, userId: string) => {
    if (!selectedCommunity) return
    
    // Approve = add to members
    const { error } = await supabase
      .from('community_members')
      .insert({ community_id: selectedCommunity.id, user_id: userId, role: 'member' })
    
    if (!error) {
      // Update request status
      await supabase
        .from('community_join_requests')
        .update({ status: 'approved', reviewed_by: userId, reviewed_at: new Date().toISOString() })
        .eq('id', requestId)
      
      await loadSettings()
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    if (!selectedCommunity) return
    
    const { error } = await supabase
      .from('community_join_requests')
      .update({ status: 'rejected', reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq('id', requestId)
    
    if (!error) {
      await loadSettings()
    }
  }

  const handlePromote = async (member: Member) => {
    if (!selectedCommunity || myRole !== 'owner') return
    
    const newRole = member.role === 'member' ? 'admin' : 'member'
    const { error } = await supabase
      .from('community_members')
      .update({ role: newRole })
      .eq('community_id', selectedCommunity.id)
      .eq('user_id', member.id)
    
    if (!error) {
      await loadSettings()
    }
  }

  const handleKick = async (member: Member) => {
    if (!selectedCommunity || !['owner', 'admin'].includes(myRole)) return
    if (member.id === userId) return
    
    const { error } = await supabase.rpc('remove_member', {
      p_community_id: selectedCommunity.id,
      p_user_id: member.id,
    })
    
    if (!error) {
      await loadSettings()
    }
  }

  const handleLeave = async () => {
    if (!selectedCommunity) return
    
    const { error } = await supabase.rpc('leave_group', {
      p_community_id: selectedCommunity.id,
    })
    
    if (!error) {
      navigate('feed')
      window.location.reload()
    }
    setShowLeaveConfirm(false)
  }

  const handleTransfer = async () => {
    if (!selectedCommunity || !transferTarget || myRole !== 'owner') return
    
    const { error } = await supabase.rpc('transfer_ownership', {
      p_community_id: selectedCommunity.id,
      p_new_owner_id: transferTarget.id,
    })
    
    if (!error) {
      await loadSettings()
    }
    setShowTransferConfirm(false)
    setTransferTarget(null)
  }

  const handleToggleMute = async () => {
    if (!selectedCommunity) return
    
    const newMuted = !isMuted
    
    // Call RPC to update server-side
    const { data, error } = await supabase.rpc('toggle_community_notifications', {
      p_community_id: selectedCommunity.id,
      p_muted: newMuted,
    })
    
    if (error || data?.status !== 'success') {
      console.error('Failed to toggle notifications:', error || data)
      return
    }
    
    // Update local state on success
    const { commNotifSettings } = useAppStore.getState()
    const existing = commNotifSettings.find((s) => s.id === selectedCommunity.id)
    
    const updated = commNotifSettings.filter((s) => s.id !== selectedCommunity.id)
    updated.push({
      id: selectedCommunity.id,
      master: !newMuted, // master=true means unmuted
      options: existing?.options ?? [],
    })
    
    useAppStore.setState({ commNotifSettings: updated })
    setIsMuted(newMuted)
  }

  if (!selectedCommunity) {
    return null
  }

  const isOwnerOrAdmin = ['owner', 'admin'].includes(myRole)

  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(14px + env(safe-area-inset-top)) 20px 14px', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>그룹 설정</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EBEBEB' }}>
        <button
          onClick={() => setActiveTab('invite')}
          style={{
            flex: 1,
            padding: '12px 0',
            fontSize: 14,
            fontWeight: activeTab === 'invite' ? 700 : 400,
            color: activeTab === 'invite' ? '#111111' : '#999999',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'invite' ? '2px solid #111111' : 'none',
            cursor: 'pointer',
          }}
        >
          초대
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            flex: 1,
            padding: '12px 0',
            fontSize: 14,
            fontWeight: activeTab === 'members' ? 700 : 400,
            color: activeTab === 'members' ? '#111111' : '#999999',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'members' ? '2px solid #111111' : 'none',
            cursor: 'pointer',
          }}
        >
          멤버 ({members.length})
        </button>
        {requiresApproval && isOwnerOrAdmin && (
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: 14,
              fontWeight: activeTab === 'requests' ? 700 : 400,
              color: activeTab === 'requests' ? '#111111' : '#999999',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'requests' ? '2px solid #111111' : 'none',
              cursor: 'pointer',
            }}
          >
            요청 ({pendingRequests.length})
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {loading && <p style={{ textAlign: 'center', color: '#999999' }}>로딩 중...</p>}

        {/* Invite Tab */}
        {activeTab === 'invite' && !loading && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#666666' }}>초대 링크</p>
              <div style={{ padding: '12px 16px', background: '#F8F9FA', borderRadius: 8, border: '1px solid #E0E0E0', marginBottom: 12, wordBreak: 'break-all', fontSize: 13, color: '#111111' }}>
                {inviteUrl}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 8,
                    background: copied ? '#22C55E' : 'transparent',
                    color: copied ? '#FFFFFF' : '#666666',
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${copied ? '#22C55E' : '#E0E0E0'}`,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ 복사 완료' : '📋 복사'}
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 8,
                    background: '#111111',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  🔗 공유하기
                </button>
              </div>
              {isOwnerOrAdmin && (
                <button
                  onClick={handleRotate}
                  disabled={rotating}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 8,
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #DC2626',
                    cursor: rotating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {rotating ? '재생성 중...' : '🔄 초대 링크 재생성'}
                </button>
              )}
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999999' }}>
                링크가 유출되었다면 재생성하세요. 기존 링크는 무효화됩니다.
              </p>
            </div>

            {/* Notification mute toggle */}
            <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111111' }}>알림 끄기</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#666666' }}>이 그룹의 알림을 받지 않습니다</p>
                </div>
                <button
                  onClick={handleToggleMute}
                  style={{
                    width: 48,
                    height: 28,
                    borderRadius: 14,
                    background: isMuted ? '#DC2626' : '#CCCCCC',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: '#FFFFFF',
                      position: 'absolute',
                      top: 2,
                      left: isMuted ? 22 : 2,
                      transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>
            </div>

            {myRole === 'owner' && (
              <div style={{ padding: '16px', background: '#F8F9FA', borderRadius: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111111' }}>가입 승인</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#666666' }}>새 멤버를 수동으로 승인합니다</p>
                  </div>
                  <button
                    onClick={handleToggleApproval}
                    style={{
                      width: 48,
                      height: 28,
                      borderRadius: 14,
                      background: requiresApproval ? '#22C55E' : '#CCCCCC',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        background: '#FFFFFF',
                        position: 'absolute',
                        top: 2,
                        left: requiresApproval ? 22 : 2,
                        transition: 'left 0.2s',
                      }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && !loading && (
          <div>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  padding: '12px 0',
                  borderBottom: '1px solid #F0F0F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111111' }}>
                    {member.nickname}
                    {member.id === userId && ' (나)'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#999999' }}>
                    {member.role === 'owner' ? '👑 그룹장' : member.role === 'admin' ? '⭐ 부그룹장' : '멤버'}
                  </p>
                </div>
                {isOwnerOrAdmin && member.id !== userId && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {myRole === 'owner' && member.role !== 'owner' && (
                      <button
                        onClick={() => handlePromote(member)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#0984E3',
                          background: 'transparent',
                          border: '1px solid #0984E3',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {member.role === 'admin' ? '멤버로' : '부그룹장'}
                      </button>
                    )}
                    {myRole === 'owner' && member.role !== 'owner' && (
                      <button
                        onClick={() => { setTransferTarget(member); setShowTransferConfirm(true) }}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#7C3AED',
                          background: 'transparent',
                          border: '1px solid #7C3AED',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        그룹장 위임
                      </button>
                    )}
                    <button
                      onClick={() => handleKick(member)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#DC2626',
                        background: 'transparent',
                        border: '1px solid #DC2626',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      내보내기
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 32 }}>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#DC2626',
                  fontSize: 14,
                  fontWeight: 700,
                  border: '1px solid #DC2626',
                  cursor: 'pointer',
                }}
              >
                {myRole === 'owner' ? '그룹 나가기 (소유권 자동 이전)' : '그룹 나가기'}
              </button>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && !loading && (
          <div>
            {pendingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999999', padding: '32px 0' }}>대기 중인 요청이 없습니다</p>
            ) : (
              pendingRequests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid #F0F0F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#111111' }}>
                      {request.nickname}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#999999' }}>
                      {new Date(request.requested_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => handleApproveRequest(request.id, request.user_id)}
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        background: '#22C55E',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#DC2626',
                        background: 'transparent',
                        border: '1px solid #DC2626',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Leave Confirm Dialog */}
      {showLeaveConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, maxWidth: 320, width: '100%' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6, wordBreak: 'keep-all' }}>
              {myRole === 'owner'
                ? '그룹을 나가면 소유권이 다른 멤버에게 자동으로 이전됩니다. 계속하시겠습니까?'
                : '그룹을 나가시겠습니까?'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent', color: '#666666', fontSize: 13, fontWeight: 600, border: '1px solid #E0E0E0', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleLeave}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#DC2626', color: '#FFFFFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Confirm Dialog */}
      {showTransferConfirm && transferTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', padding: 24 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 20, maxWidth: 320, width: '100%' }}>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#111111', lineHeight: 1.6, wordBreak: 'keep-all' }}>
              <strong>{transferTarget.nickname}</strong>님에게 그룹장 권한을 이전하시겠습니까? 이 작업은 취소할 수 없습니다.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setShowTransferConfirm(false); setTransferTarget(null) }}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: 'transparent', color: '#666666', fontSize: 13, fontWeight: 600, border: '1px solid #E0E0E0', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleTransfer}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#7C3AED', color: '#FFFFFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                위임하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
