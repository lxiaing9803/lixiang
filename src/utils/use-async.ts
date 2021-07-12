import { useMountRef } from './index';
import { useCallback, useReducer, useState } from 'react';
interface State<D> {
    error: null | Error,
    data: D | null,
    stat: 'idle' | 'loading' | 'error' | 'success'
}

const defaultInitialState: State<null> = {
    stat: 'idle',
    data: null,
    error: null
}

const defaultConfig = {
    throwOnError: false
}

const useSafeDispatch = <T>(dispatch: (...args: T[]) => void) => {
    const mountRef = useMountRef()

    return useCallback((...args: T[]) => (mountRef.current ? dispatch(...args) : void 0), [dispatch, mountRef])
}

export const useAsync = <D>(initialState?: State<D>, initialConfig?: typeof defaultConfig) => {
    const config = { ...defaultConfig, ...initialConfig }
    const [state, dispatch] = useReducer(
        (state: State<D>, action: Partial<State<D>>) => ({ ...state, ...action }),
        {
            ...defaultInitialState,
            ...initialState
        }
    )

    const safeDispatch = useSafeDispatch(dispatch)

    const [retry, setRetry] = useState(() => () => { })

    const setData = useCallback((data: D) => safeDispatch({
        data,
        stat: 'success',
        error: null
    }), [safeDispatch])

    const setError = useCallback((error: Error) => safeDispatch({
        error,
        stat: 'error',
        data: null
    }), [safeDispatch])

    // 触发异步
    const run = useCallback(
        (promise: Promise<D>, runConfig?: { retry: () => Promise<D> }) => {
            if (!promise || !promise.then) {
                throw new Error('请传入Promise类型数据')
            }
            setRetry(() => () => {
                if (runConfig?.retry) {
                    run(runConfig?.retry(), runConfig)
                }

            })
            safeDispatch({ stat: 'loading' })
            return promise.then(data => {

                setData(data)
                return data


            }).catch(error => {
                // 这里的catch会消化异常，如果不主动抛出，就不能在外面接收到异常
                setError(error)
                if (config.throwOnError) {
                    console.log(config.throwOnError)
                    return Promise.reject(error)
                }

                return error
            })

        }, [config.throwOnError, safeDispatch, setData, setError])



    return {
        isIdle: state.stat === 'idle',
        isLoading: state.stat === 'loading',
        isError: state.stat === 'error',
        isSuccess: state.stat === 'success',
        // retry调用时重新执行一次run
        retry,
        run,
        setData,
        setError,
        ...state
    }
}