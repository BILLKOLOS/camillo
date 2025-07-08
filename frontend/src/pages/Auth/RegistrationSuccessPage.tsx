import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Header, Title, Subtitle, Button } from '../../styles/components';

const RegistrationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Header>
        <Title>Registration Successful!</Title>
        <Subtitle>Your account has been created. You can now log in.</Subtitle>
      </Header>
      <Button style={{ width: 220, margin: '0 auto', display: 'block' }} onClick={() => navigate('/auth/login')}>
        Go to Login
      </Button>
    </Container>
  );
};

export default RegistrationSuccessPage; 