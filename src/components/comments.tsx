import {Textarea} from "@mantine/core";
import {useForm} from "@mantine/form"

export function CommentBox() {
    const form = useForm({
        initialValues: {
            id: 0,
            message: ''
        },
        validate: {
            message: (value: string) => (/[&/\\#,+()$~%.^'":*?<>{}]/g.test(value) ? "Invalid characters" : null),
        },
    });
    return <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <Textarea
            placeholder="Your comment"
            maxRows={2}
            autosize
        />
    </form>
}