// Reusable Modal Wrapper
// Instead of building the pop-up logic over and over, we build one wrapper and pass our forms inside it.

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '300px',
          color: 'black',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>{title}</h3>
          <button onClick={onClose}>X</button>
        </div>
        <hr />
        {/* The forms will render right here! */}
        {children}
      </div>
    </div>
  );
};
