import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorPage({ code, fileName: initialFileName }) {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const valueGetter = useRef<() => string>();
  const editorRef = useRef();
  const [name, setName] = useState(initialFileName);

  useEffect(() => {
    if (editorRef.current) {
      bindSaveCommand(editorRef.current, () => saveFileAs(name));
    }
  }, [name]);

  function handleEditorDidMount(_valueGetter: () => string, editor) {
    setIsEditorReady(true);
    valueGetter.current = _valueGetter;
    editorRef.current = editor;
    bindSaveCommand(editor, () => saveFileAs(name));
  }

  function saveFileAs(fileName: string) {
    if (valueGetter.current == null) {
      return;
    }
    const url = "/static/" + fileName + window.location.search;
    fetch(url, {
      method: "PUT",
      body: valueGetter.current(),
    })
      .then((res) => {
        if (res.status === 200) {
          window.location.href = "/" + window.location.search;
        } else {
          res.text().then((msg) => {
            window.alert(msg);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  const language = extToLanguage(name.split(".")[1]);

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          width: "200px",
          backgroundColor: "#333",
          color: "white",
          flexShrink: 0,
          padding: "8px",
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={() => saveFileAs(name)}>Save</button>
        <p>
          <i>File Picker (coming soon)</i>
        </p>
      </div>
      <Editor
        height="100vh"
        language={language}
        value={code}
        editorDidMount={handleEditorDidMount}
      />
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { code, fileName } = query;
  return {
    props: {
      code: code || "",
      fileName: fileName || "Untitled",
    },
  };
}

function extToLanguage(ext: string) {
  if (["py"].includes(ext)) return "python";
  if (["ts", "tsx"].includes(ext)) return "typescript";
  if (["js", "jsx"].includes(ext)) return "javascript";
  if (ext === "html") return "html";
  return "";
  //throw new Error('Unsupported language');
}

function bindSaveCommand(editor: any, callback) {
  editor.addAction({
    // An unique identifier of the contributed action.
    id: "save-command",

    // A label of the action that will be presented to the user.
    label: "Save",

    // An optional array of keybindings for the action.
    keybindings: [KeyMod.CtrlCmd | KeyCode.KEY_S],

    // A precondition for this action.
    precondition: null,

    // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
    keybindingContext: null,

    contextMenuGroupId: "navigation",

    contextMenuOrder: 1.5,

    // Method that will be executed when the action is triggered.
    // @param editor The editor instance is passed in as a convinience
    run: function (ed) {
      callback();
    },
  });
}

export enum KeyMod {
  CtrlCmd = (1 << 11) >>> 0,
  Shift = (1 << 10) >>> 0,
  Alt = (1 << 9) >>> 0,
  WinCtrl = (1 << 8) >>> 0,
}

export function KeyChord(firstPart: number, secondPart: number): number {
  const chordPart = ((secondPart & 0x0000ffff) << 16) >>> 0;
  return (firstPart | chordPart) >>> 0;
}

export enum KeyCode {
  /**
   * Placed first to cover the 0 value of the enum.
   */
  Unknown = 0,

  Backspace = 1,
  Tab = 2,
  Enter = 3,
  Shift = 4,
  Ctrl = 5,
  Alt = 6,
  PauseBreak = 7,
  CapsLock = 8,
  Escape = 9,
  Space = 10,
  PageUp = 11,
  PageDown = 12,
  End = 13,
  Home = 14,
  LeftArrow = 15,
  UpArrow = 16,
  RightArrow = 17,
  DownArrow = 18,
  Insert = 19,
  Delete = 20,

  KEY_0 = 21,
  KEY_1 = 22,
  KEY_2 = 23,
  KEY_3 = 24,
  KEY_4 = 25,
  KEY_5 = 26,
  KEY_6 = 27,
  KEY_7 = 28,
  KEY_8 = 29,
  KEY_9 = 30,

  KEY_A = 31,
  KEY_B = 32,
  KEY_C = 33,
  KEY_D = 34,
  KEY_E = 35,
  KEY_F = 36,
  KEY_G = 37,
  KEY_H = 38,
  KEY_I = 39,
  KEY_J = 40,
  KEY_K = 41,
  KEY_L = 42,
  KEY_M = 43,
  KEY_N = 44,
  KEY_O = 45,
  KEY_P = 46,
  KEY_Q = 47,
  KEY_R = 48,
  KEY_S = 49,
  KEY_T = 50,
  KEY_U = 51,
  KEY_V = 52,
  KEY_W = 53,
  KEY_X = 54,
  KEY_Y = 55,
  KEY_Z = 56,

  Meta = 57,
  ContextMenu = 58,

  F1 = 59,
  F2 = 60,
  F3 = 61,
  F4 = 62,
  F5 = 63,
  F6 = 64,
  F7 = 65,
  F8 = 66,
  F9 = 67,
  F10 = 68,
  F11 = 69,
  F12 = 70,
  F13 = 71,
  F14 = 72,
  F15 = 73,
  F16 = 74,
  F17 = 75,
  F18 = 76,
  F19 = 77,

  NumLock = 78,
  ScrollLock = 79,

  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the ';:' key
   */
  US_SEMICOLON = 80,
  /**
   * For any country/region, the '+' key
   * For the US standard keyboard, the '=+' key
   */
  US_EQUAL = 81,
  /**
   * For any country/region, the ',' key
   * For the US standard keyboard, the ',<' key
   */
  US_COMMA = 82,
  /**
   * For any country/region, the '-' key
   * For the US standard keyboard, the '-_' key
   */
  US_MINUS = 83,
  /**
   * For any country/region, the '.' key
   * For the US standard keyboard, the '.>' key
   */
  US_DOT = 84,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the '/?' key
   */
  US_SLASH = 85,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the '`~' key
   */
  US_BACKTICK = 86,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the '[{' key
   */
  US_OPEN_SQUARE_BRACKET = 87,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the '\|' key
   */
  US_BACKSLASH = 88,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the ']}' key
   */
  US_CLOSE_SQUARE_BRACKET = 89,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   * For the US standard keyboard, the ''"' key
   */
  US_QUOTE = 90,
  /**
   * Used for miscellaneous characters; it can vary by keyboard.
   */
  OEM_8 = 91,
  /**
   * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
   */
  OEM_102 = 92,

  NUMPAD_0 = 93, // VK_NUMPAD0, 0x60, Numeric keypad 0 key
  NUMPAD_1 = 94, // VK_NUMPAD1, 0x61, Numeric keypad 1 key
  NUMPAD_2 = 95, // VK_NUMPAD2, 0x62, Numeric keypad 2 key
  NUMPAD_3 = 96, // VK_NUMPAD3, 0x63, Numeric keypad 3 key
  NUMPAD_4 = 97, // VK_NUMPAD4, 0x64, Numeric keypad 4 key
  NUMPAD_5 = 98, // VK_NUMPAD5, 0x65, Numeric keypad 5 key
  NUMPAD_6 = 99, // VK_NUMPAD6, 0x66, Numeric keypad 6 key
  NUMPAD_7 = 100, // VK_NUMPAD7, 0x67, Numeric keypad 7 key
  NUMPAD_8 = 101, // VK_NUMPAD8, 0x68, Numeric keypad 8 key
  NUMPAD_9 = 102, // VK_NUMPAD9, 0x69, Numeric keypad 9 key

  NUMPAD_MULTIPLY = 103, // VK_MULTIPLY, 0x6A, Multiply key
  NUMPAD_ADD = 104, // VK_ADD, 0x6B, Add key
  NUMPAD_SEPARATOR = 105, // VK_SEPARATOR, 0x6C, Separator key
  NUMPAD_SUBTRACT = 106, // VK_SUBTRACT, 0x6D, Subtract key
  NUMPAD_DECIMAL = 107, // VK_DECIMAL, 0x6E, Decimal key
  NUMPAD_DIVIDE = 108, // VK_DIVIDE, 0x6F,

  /**
   * Cover all key codes when IME is processing input.
   */
  KEY_IN_COMPOSITION = 109,

  ABNT_C1 = 110, // Brazilian (ABNT) Keyboard
  ABNT_C2 = 111, // Brazilian (ABNT) Keyboard

  /**
   * Placed last to cover the length of the enum.
   * Please do not depend on this value!
   */
  MAX_VALUE,
}
