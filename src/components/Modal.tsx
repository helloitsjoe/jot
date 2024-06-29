import * as React from 'react';
import Box from './Box';

type ModalContextType = {
  openModal?: () => void;
  closeModal?: () => void;
  setModalContent?: (content: React.ReactNode) => void;
};

export const ModalContext = React.createContext<ModalContextType>({});

export const withModal = (Component) => {
  return function withModal(props) {
    return (
      <ModalProvider>
        <Component {...props} />
      </ModalProvider>
    );
  };
};

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<React.ReactNode>();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const value = React.useMemo(
    () => ({ openModal, closeModal, setModalContent }),
    []
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {isOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100%"
          height="100vh"
          bg="rgba(0, 0, 0, 0.7)"
          onClick={closeModal}
        >
          <Box
            // TODO: aria-labelledby
            role="dialog"
            // TODO: Expose a way to control position
            p="2em"
            m="2em"
            onClick={(e) => {
              e.stopPropagation();
            }}
            border="1px solid lime"
            borderRadius="0.4em"
            bg="black"
          >
            {modalContent}
          </Box>
        </Box>
      )}
    </ModalContext.Provider>
  );
}
