import { UserProfile } from '@clerk/nextjs';

const UserProfilePage = () => (
  <div className="w-full">
    <UserProfile
      appearance={{
        elements: {
          card: 'w-full',
          cardBox: 'w-full',
        },
      }}
    />
  </div>
);

export default UserProfilePage;
