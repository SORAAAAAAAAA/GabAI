'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/infra/supabase/supabaseClient';

export function useUserName() {
    const [userName, setUserName] = useState<string>('User');

    useEffect(() => {
      const getUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const fullName = 
            user.user_metadata?.name || 
            user.user_metadata?.full_name || 
            user.user_metadata?.display_name ||
            user.email?.split('@')[0] || 
            'User';
          
          setUserName(fullName);
          
          
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || 'User';
          setUserName(firstName);
          
        }
      };
      
      getUser();
    }, []);

    return userName;
}