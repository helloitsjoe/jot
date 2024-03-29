import React from 'react';
import Box from './Box';

export const ModalContext = React.createContext({});

export const withModal = (Component) => (props) =>
  (
    <ModalProvider>
      <Component {...props} />
    </ModalProvider>
  );

export default function ModalProvider({ children }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalContent, setModalContent] = React.useState();

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
