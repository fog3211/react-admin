import React, { Component } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Button, message, Spin } from 'antd';
import Service from '@/service';
import './index.less';

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
	<EditableContext.Provider value={form}>
		<tr {...props} />
	</EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
	getInput = () => {
		if (this.props.inputType === 'number') {
			return <InputNumber />;
		}
		return <Input />;
	};
	render() {
		const { editing, dataIndex, title, inputType, record, index, ...restProps } = this.props;
		return (
			<EditableContext.Consumer>
				{(form) => {
					const { getFieldDecorator } = form;
					return (
						<td {...restProps}>
							{editing ? (
								<FormItem style={{ margin: 0 }}>
									{getFieldDecorator(dataIndex, {
										rules: [
											{
												required: true,
												message: `请输入${title}!`
											}
										],
										initialValue: record[dataIndex]
									})(this.getInput())}
								</FormItem>
							) : (
								restProps.children
							)}
						</td>
					);
				}}
			</EditableContext.Consumer>
		);
	}
}

export default class EditableTable extends Component {
	constructor(props) {
		super(props);
		this.state = { data: [], editingKey: '', global_loading: false };
		this.columns = [
			{
				title: '姓名',
				dataIndex: 'name',
				width: '25%',
				editable: true
			},
			{
				title: '年龄',
				dataIndex: 'age',
				width: '15%',
				editable: true
			},
			{
				title: '地址',
				dataIndex: 'address',
				width: '40%',
				editable: true
			},
			{
				title: '操作',
				dataIndex: 'operation',
				render: (text, record) => {
					const editable = this.isEditing(record);
					return (
						<div>
							{editable ? (
								<span>
									<EditableContext.Consumer>
										{(form) => (
											<Button
												onClick={() => this.save(form, record.key)}
												style={{
													marginRight: 8,
													marginBottom: 10
												}}
											>
												保存
											</Button>
										)}
									</EditableContext.Consumer>
									<Popconfirm
										title="确认取消?"
										onConfirm={() => this.cancel(record.key)}
										style={{ marginBottom: 10 }}
									>
										<Button>取消</Button>
									</Popconfirm>
								</span>
							) : (
								<Button
									onClick={() => this.edit(record.key)}
									style={{ marginRight: 5, marginBottom: 10 }}
								>
									编辑
								</Button>
							)}
							{this.state.data.length >= 1 ? (
								<Popconfirm title="确认删除?" onConfirm={() => this.handleDelete(record.key)}>
									<Button type="danger">删除</Button>
								</Popconfirm>
							) : null}
						</div>
					);
				}
			}
		];
	}
	componentWillMount() {
		Service.getTableData({
			type: 'editable_table'
		}).then((res) => {
			if (res.code === 1) {
				this.setState({
					data: res.data
				});
			} else {
				message.error('可编辑表格数据获取失败，请重试');
			}
		});
	}
	componentDidMount() {
		this.setState({ global_loading: true });
		setTimeout(() => {
			this.setState({ global_loading: false });
		}, 1500);
	}
	isEditing = (record) => {
		return record.key === this.state.editingKey;
	};
	edit(key) {
		this.setState({ editingKey: key });
	}
	save(form, key) {
		form.validateFields((error, row) => {
			if (error) {
				return;
			}
			const newData = [ ...this.state.data ];
			const index = newData.findIndex((item) => key === item.key);
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				this.setState({ data: newData, editingKey: '' });
			} else {
				newData.push(this.state.data);
				this.setState({ data: newData, editingKey: '' });
			}
		});
	}
	cancel = () => {
		this.setState({ editingKey: '' });
	};
	handleDelete = (key) => {
		const data = [ ...this.state.data ];
		this.setState({ data: data.filter((item) => item.key !== key) });
	};
	handleAdd = () => {
		const { data } = this.state;
		let count = data.length;
		const newData = {
			key: data.length + 1 + count,
			name: '无名',
			address: '不详',
			age: '不详'
		};
		this.setState({
			data: [ ...data, newData ],
			count: count + 1
		});
	};
	render() {
		const { global_loading } = this.state;
		const components = {
			body: {
				row: EditableFormRow,
				cell: EditableCell
			}
		};

		const columns = this.columns.map((col) => {
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: (record) => ({
					record,
					inputType: col.dataIndex === 'age' ? 'number' : 'text',
					dataIndex: col.dataIndex,
					title: col.title,
					editing: this.isEditing(record)
				})
			};
		});

		return (
			<Spin spinning={global_loading} size="large">
				<Button onClick={this.handleAdd} type="primary" style={{ marginTop: 10, marginBottom: 16 }}>
					添加一行
				</Button>
				<Table
					components={components}
					bordered
					dataSource={this.state.data}
					columns={columns}
					rowClassName="editable-row"
				/>
			</Spin>
		);
	}
}
