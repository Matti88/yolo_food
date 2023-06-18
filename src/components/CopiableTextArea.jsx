// import React, { useRef } from 'react';

// const CopyableTextArea = ({ text }) => {
//   const textAreaRef = useRef(null);

//   const copyToClipboard = () => {
//     textAreaRef.current.select();
//     document.execCommand('copy');
//   };

//   return (
//     <div style={{ width: '400px', background: '#f2f2f2', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
//       <div style={{ background: '#333', color: '#fff', padding: '10px', borderRadius: '5px 5px 0 0' }}>
//         <h2 style={{ margin: 0 }}>Recepie Prompt</h2>
//         <button
//           style={{ marginTop: '10px', padding: '5px 10px', display: 'block', float: 'right' }}
//           onClick={copyToClipboard}
//         > Copy to Clipboard </button>        
//       </div>

//       <div style={{ padding: '10px' }}>
//         <textarea ref={textAreaRef} value={text} style={{ width: '100%', height: '200px', border: 'none', resize: 'none' }} readOnly />



//       </div>
//     </div>
//   );
// };

// export default CopyableTextArea;


import React, { useRef } from 'react';

const CopyableTextArea = ({ text }) => {
  const textAreaRef = useRef(null);

  const copyToClipboard = () => {
    textAreaRef.current.select();
    document.execCommand('copy');
  };

  return (
    <div style={{ width: '400px', background: '#f2f2f2', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
      <div style={{ background: '#333', color: '#fff', padding: '10px', borderRadius: '5px 5px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Recepie Prompt</h2>
        <button
          style={{ padding: '5px 10px' }}
          onClick={copyToClipboard}
        >
          Copy to Clipboard
        </button>
      </div>

      <div style={{ padding: '10px' }}>
        <textarea ref={textAreaRef} value={text} style={{ width: '100%', height: '200px', border: 'none', resize: 'none' }} readOnly />
      </div>
    </div>
  );
};

export default CopyableTextArea;
