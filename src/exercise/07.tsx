// Control Props
// http://localhost:3000/isolated/exercise/07.tsx

import * as React from 'react'
import {Switch} from '../switch'
import {useControlPropWarnings} from '../utils'


function callAll<Args extends Array<unknown>>(
  ...fns: Array<((...args: Args) => unknown) | undefined>
) {
  return (...args: Args) => fns.forEach(fn => fn?.(...args))
}

type ToggleState = {on: boolean}
type ToggleAction =
  | {type: 'toggle'}
  | {type: 'reset'; initialState: ToggleState}

function toggleReducer(state: ToggleState, action: ToggleAction) {
  switch (action.type) {
    case 'toggle': {
      return {on: !state.on}
    }
    case 'reset': {
      return action.initialState
    }
  }
}

function useToggle({
  controlledOn,
  onChange,
  initialOn = false,
  reducer = toggleReducer,
}: {
  onChange?: (state: ToggleState, action: ToggleAction) => void
  controlledOn?: boolean
  initialOn?: boolean
  reducer?: typeof toggleReducer
} = {}) {
  const {current: initialState} = React.useRef<ToggleState>({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const on = controlledOn ?? state.on

  const dispatchOnChange = (action: ToggleAction) => {
    if (!controlledOn) {
      dispatch(action)
    }

    onChange?.(reducer({...state, on}, action), action)
  }

  const toggle = () => dispatchOnChange({type: 'toggle'})
  const reset = () => dispatchOnChange({type: 'reset', initialState})

  function getTogglerProps<Props>({
    onClick,
    ...props
  }: {onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']} & Props) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps<Props>({
    onClick,
    ...props
  }: {onClick?: React.DOMAttributes<HTMLButtonElement>['onClick']} & Props) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({
  readOnly,
  initialOn = false,
  on: controlledOn,
  onChange,
}: {
  readOnly?: boolean
  initialOn?: boolean
  on?: boolean
  onChange?: (state: ToggleState, action: ToggleAction) => void
}) {
  useControlPropWarnings({
    controlPropValue: controlledOn,
    componentName: 'Toggle',
    initialValueProp: 'initialOn',
    hasOnChange: Boolean(onChange),
    readOnly,
    readOnlyProp: 'readOnly',
    onChangeProp: 'onChange',
    controlPropName: 'on',
  })

  const {on, getTogglerProps} = useToggle({
    controlledOn,
    onChange,
    initialOn,
  })

  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state: ToggleState, action: ToggleAction) {
    if (action.type === 'toggle' && timesClicked > 4) {
      return
    }
    setBothOn(state.on)
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
    <div>
      <div>
        <Toggle on={bothOn} onChange={handleToggleChange} />
        <Toggle on={bothOn} onChange={handleToggleChange} />
      </div>
      {timesClicked > 4 ? (
        <div data-testid="notice">
          Whoa, you clicked too much!
          <br />
        </div>
      ) : (
        <div data-testid="click-count">Click count: {timesClicked}</div>
      )}
      <button onClick={handleResetClick}>Reset</button>
      <hr />
      <div>
        <div>Uncontrolled Toggle:</div>
        <Toggle
          onChange={(...args) =>
            console.info('Uncontrolled Toggle onChange', ...args)
          }
        />
      </div>
    </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
