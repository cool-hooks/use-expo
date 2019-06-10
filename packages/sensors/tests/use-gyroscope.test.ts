const { Gyroscope } = jest.genMockFromModule('expo-sensors');
const Subscription = { remove: jest.fn() };

Gyroscope.addListener.mockReturnValue(Subscription);
jest.mock('expo-sensors', () => ({ Gyroscope }));

import { renderHook, act } from 'react-hooks-testing-library';
import { useGyroscope } from '../src/use-gyroscope';

const DATA = 0;
const AVAILABLE = 1;

test('returns state and availability when mounted', () => {
	const hook = renderHook(() => useGyroscope({ getAvailability: false }));

	expect(hook.result.current[DATA]).toBeUndefined();
	expect(hook.result.current[AVAILABLE]).toBeUndefined();
});

test('handles new gyroscope availability', async () => {
	(Gyroscope.isAvailableAsync as jest.Mock).mockResolvedValue(true);
	const hook = renderHook(useGyroscope);

	await hook.waitForNextUpdate();

	expect(hook.result.current[AVAILABLE]).toBe(true);
});

test('handles new gyroscope data', async () => {
	const hook = renderHook(() => useGyroscope({ getAvailability: false }));
	const handler = Gyroscope.addListener.mock.calls[0][0];
	const newData = { x: 0, y: 1, z: 0.5 };

	act(() => handler(newData));
	expect(hook.result.current[DATA]).toMatchObject(newData);
});

describe('event listener', () => {
	test('is added when mounted', () => {
		renderHook(() => useGyroscope({ getAvailability: false }));
		expect(Gyroscope.addListener).toBeCalled();
	});

	test('is removed when unmounted', () => {
		const hook = renderHook(() => useGyroscope({ getAvailability: false }));

		hook.unmount();
		expect(Subscription.remove).toBeCalled();
	});

	test('checks availability when mounted', () => {
		renderHook(useGyroscope);
		expect(Gyroscope.isAvailableAsync).toBeCalled();
	});
});

describe('options', () => {
	test('initial data is returned', () => {
		const initialData = { x: 1, y: 1, z: 1 };
		const hook = renderHook(() => useGyroscope({ initialData, getAvailability: false }));

		expect(hook.result.current[DATA]).toMatchObject(initialData);
	});

	test('update interval is set', () => {
		renderHook(() => useGyroscope({ updateInterval: 1500, getAvailability: false }));
		expect(Gyroscope.setUpdateInterval).toBeCalledWith(1500);
	});

	test('availability check is skipped', () => {
		renderHook(() => useGyroscope({ getAvailability: false }));
		expect(Gyroscope.isAvailableAsync).not.toBeCalled();
	});
});
