// src/components/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando...</p>
      </div>
    </div>
  );
};

export default Loading;