'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/infra/supabase/supabaseClient';

export function useUserName() {
    const [userName, setUserName] = useState<string>('User');
    const hasRunRef = useRef(false);

    useEffect(() => {
      if (hasRunRef.current) return;
      hasRunRef.current = true;

      const getUser = async () => {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const fullName = 
              user.user_metadata?.name || 
              user.user_metadata?.full_name || 
              user.user_metadata?.display_name ||
              user.email?.split('@')[0] || 
              'User';
            
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || 'User';
            setUserName(firstName);
          }
        } catch (error) {
          console.error('Error fetching user name:', error);
        }
      };
      
      getUser();
    }, []);

    return { userName };
}